// Creates an in-app notification. `db` can be the pool or a transaction client.
export async function notify(db, userId, type, message, link = '') {
  await db.query('INSERT INTO notifications (user_id, type, message, link) VALUES ($1,$2,$3,$4)', [userId, type, message.slice(0, 300), link]);
}
