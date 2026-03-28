import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId mancante' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { menuItem: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FatturaElettronica versione="FPR12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>01234567890</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>00001</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>XXXXXXX</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>01234567890</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Pizzeria da Luigi</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Roma 1</Indirizzo>
        <CAP>80100</CAP>
        <Comune>Napoli</Comune>
        <Provincia>NA</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${new Date().toISOString().split('T')[0]}</Data>
        <Numero>${order.id.slice(0, 10)}</Numero>
        <ImportoTotaleDocumento>${(order.total / 100).toFixed(2)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${order.items.map((item, i) => `      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${item.menuItem?.name ?? 'Articolo'}</Descrizione>
        <Quantita>${item.quantity}.00</Quantita>
        <PrezzoUnitario>${(item.price / 100).toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${((item.price * item.quantity) / 100).toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>`).join('\n')}
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>MP08</ModalitaPagamento>
        <DataScadenzaPagamento>${new Date().toISOString().split('T')[0]}</DataScadenzaPagamento>
        <ImportoPagamento>${(order.total / 100).toFixed(2)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</FatturaElettronica>`

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Errore generazione fattura' }, { status: 500 })
  }
}
