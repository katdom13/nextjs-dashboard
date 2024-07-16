'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({id: true, date: true})

export const createInvoice = async (formData: FormData) => {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    // Store amount in cents
    const amountInCents = amount * 100

    // Create new date with format 'YYYY-MM-DD'
    const date = new Date().toISOString().split('T')[0]

    // Insert the data into the database
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `

    // Revalidate and redirect

    // After updating the data displayed in the invoices route, clear this cache and trigger
    // a new request to the server.
    revalidatePath('/dashboard/invoices')

    // Redirect back to the invoices page
    redirect('/dashboard/invoices')
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export const updateInvoice = async (id: string, formData: FormData) => {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    const amountInCents = amount * 100

    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export const deleteInvoice = async (id: string) => {
    await sql`
        DELETE FROM invoices WHERE id = ${id}
    `
    revalidatePath('/dashboard/invoices')
}
