import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://deisishop.pythonanywhere.com/products/");
    if (!response.ok) {
      throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

