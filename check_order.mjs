import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.ifrismvjfuoaqjyfhgdh:Rushik%241600%23@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function checkOrder() {
  await client.connect();
  try {
    const res = await client.query("SELECT * FROM orders WHERE id='VMX-5AELXS'");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkOrder();
