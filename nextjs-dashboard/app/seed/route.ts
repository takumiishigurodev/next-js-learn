import bcrypt from "bcrypt";
import { db } from "@vercel/postgres";
import { invoices, customers, revenue, users } from "../lib/placeholder-data";
import { Client } from "pg";

// const client = await db.connect();
const client = new Client({
  user: "postgres",
  password: "postgres",
  host: "db",
  database: "postgres",
  port: 5432,
});

async function seedUsers() {
  await client
    .query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    .catch((err: any) =>
      console.error("seedUsers create extension error", err.stack)
    );
  await client
    .query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `
    )
    .catch((err: any) =>
      console.error("seedUsers create table error", err.stack)
    );

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client
        .query(
          `
          INSERT INTO users (id, name, email, password)
          VALUES ( '${user.id}' , '${user.name}', '${user.email}', '${hashedPassword}')
          ON CONFLICT (id) DO NOTHING;
        `
        )
        .catch((err: any) =>
          console.error("seedUsers insert table error", err.stack)
        );
    })
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client
    .query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    .catch((err: any) =>
      console.error("seedInvoices create extension error", err.stack)
    );

  await client
    .query(
      `
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      );
    `
    )
    .catch((err: any) =>
      console.error("seedInvoices create TABLE error", err.stack)
    );

  const insertedInvoices = await Promise.all(
    invoices.map((invoice) =>
      client
        .query(
          `
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES ( '${invoice.customer_id}' , '${invoice.amount}', '${invoice.status}', '${invoice.date}')
        ON CONFLICT (id) DO NOTHING;
      `
        )
        .catch((err: any) =>
          console.error("seedInvoices insert TABLE error", err.stack)
        )
    )
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client
    .query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    .catch((err: any) =>
      console.error("seedCustomers create extension error", err.stack)
    );

  await client
    .query(
      `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `
    )
    .catch((err: any) =>
      console.error("seedCustomers create table error", err.stack)
    );

  const insertedCustomers = await Promise.all(
    customers.map((customer) =>
      client
        .query(
          `
        INSERT INTO customers (id, name, email, image_url)
        VALUES ( '${customer.id}' , '${customer.name}', '${customer.email}', '${customer.image_url}')
        ON CONFLICT (id) DO NOTHING;
      `
        )
        .catch((err: any) =>
          console.error("seedCustomers insert table error", err.stack)
        )
    )
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client
    .query(
      `
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `
    )
    .catch((err: any) =>
      console.error("seedRevenue create table error", err.stack)
    );

  const insertedRevenue = await Promise.all(
    revenue.map((rev) =>
      client
        .query(
          `
        INSERT INTO revenue (month, revenue)
        VALUES ( '${rev.month}' , ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `
        )
        .catch((err: any) =>
          console.error("seedRevenue insert table error", err.stack)
        )
    )
  );

  return insertedRevenue;
}

export async function GET() {
  return Response.json({
    message:
      "Uncomment this file and remove this line. You can delete this file when you are finished.",
  });
  // try {
  //   client.connect();
  //   console.log("connected");
  //   await seedUsers();
  //   await seedCustomers();
  //   await seedInvoices();
  //   await seedRevenue();

  //   return Response.json({ message: "Database seeded successfully" });
  // } catch (error) {
  //   return Response.json({ error }, { status: 500 });
  // }
}
