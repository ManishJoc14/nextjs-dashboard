import { NextResponse } from "next/server";

const { db } = require('@vercel/postgres');
const bcrypt = require('bcrypt');
import {
    invoices,
    customers,
    revenue,
    users,
} from '../../../app/lib/placeholder-data.js';

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

async function seedUsers(client: any): Promise<{ createTable: any; users: any[] }> {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        // Create the "users" table if it doesn't exist
        const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

        console.log(`Created "users" table`);

        // Insert data into the "users" table
        const insertedUsers = await Promise.all(
            (users as User[]).map(async (user: User) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
            }),
        );

        console.log(`Seeded ${insertedUsers.length} users`);

        return {
            createTable,
            users: insertedUsers,
        };
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
}

interface Invoice {
    id: string;
    customer_id: string;
    amount: number;
    status: string;
    date: string;
}

async function seedInvoices(client: any): Promise<{ createTable: any; invoices: any[] }> {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // Create the "invoices" table if it doesn't exist
        const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );
`;

        console.log(`Created "invoices" table`);

        // Insert data into the "invoices" table
        const insertedInvoices = await Promise.all(
            (invoices as Invoice[]).map(
                (invoice: Invoice) => client.sql`
                INSERT INTO invoices (customer_id, amount, status, date)
                VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
                ON CONFLICT (id) DO NOTHING;
              `,
            ),
        );

        console.log(`Seeded ${insertedInvoices.length} invoices`);

        return {
            createTable,
            invoices: insertedInvoices,
        };
    } catch (error) {
        console.error('Error seeding invoices:', error);
        throw error;
    }
}

interface Customer {
    id: string;
    name: string;
    email: string;
    image_url: string;
}

async function seedCustomers(client: any): Promise<{ createTable: any; customers: any[] }> {
    try {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // Create the "customers" table if it doesn't exist
        const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

        console.log(`Created "customers" table`);

        // Insert data into the "customers" table
        const insertedCustomers = await Promise.all(
            customers.map(
                (customer: Customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
          `,
            ),
        );

        console.log(`Seeded ${insertedCustomers.length} customers`);

        return {
            createTable,
            customers: insertedCustomers,
        };
    } catch (error) {
        console.error('Error seeding customers:', error);
        throw error;
    }
}

interface Revenue {
    month: string;
    revenue: number;
}

async function seedRevenue(client: any): Promise<{ createTable: any; revenue: any[] }> {
    try {
        // Create the "revenue" table if it doesn't exist
        const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

        console.log(`Created "revenue" table`);

        // Insert data into the "revenue" table
        const insertedRevenue = await Promise.all(
            revenue.map(
                (rev: Revenue) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
          `,
            ),
        );

        console.log(`Seeded ${insertedRevenue.length} revenue`);

        return {
            createTable,
            revenue: insertedRevenue,
        };
    } catch (error) {
        console.error('Error seeding revenue:', error);
        throw error;
    }
}

export async function GET() {
    try {
        const client = await db.connect();

        await seedUsers(client);
        await seedCustomers(client);
        await seedInvoices(client);
        await seedRevenue(client);

        await client.end();

        return NextResponse.json({ message: "Database seeded successfully" });
    } catch (error) {
        console.error("Error seeding database:", error);
        return NextResponse.json({ error: "Error seeding database" }, { status: 500 });
    }
}