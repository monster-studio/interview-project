import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pokemon — list all Pokémon species (for the assignment form dropdown)
export async function GET() {
    const pokemon = await prisma.pokemon.findMany({
        orderBy: { number: "asc" },
    });
    return NextResponse.json(pokemon);
}
