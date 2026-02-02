const BASE_URL = "http://localhost:5000"

export async function fetchLayer1Status(){
    const res = await fetch(`${BASE_URL}/layer1-status`);
    return res.json();
}