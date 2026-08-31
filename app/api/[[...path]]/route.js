import { NextResponse } from 'next/server'

// Legacy catch-all route — returns 404 for any unmatched API paths.
// The old MongoDB status-check endpoints have been removed.
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
export async function PUT() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
export async function DELETE() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
export async function PATCH() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}