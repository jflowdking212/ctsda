async function main() {
  try {
    const res = await fetch('https://ctsda.acecoterieconsulting.com/api/training').catch(() => null) || 
                await fetch('http://localhost:4000/training').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      console.log('Trainings count:', data.length);
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    console.log('API response not ok or unreachable');
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}
main();
