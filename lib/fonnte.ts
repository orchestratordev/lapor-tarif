export async function kirimWA(
  nomorHP: string,
  pesan: string
) {
  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': process.env.FONNTE_TOKEN!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      target: nomorHP,
      message: pesan,
      countryCode: '62'
    })
  })
  return response.json()
}
