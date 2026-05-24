import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssignPokemonSchema } from "@/lib/schemas";

// GET /api/trainers/[id]/pokemon — all pokemon for a trainer (split into bag & bank)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const pokemon = await prisma.trainerPokemon.findMany({
        where: { trainerId: id },
        include: { pokemon: true },
        orderBy: { pokemon: { name: "asc" } },
    });

    const bag = pokemon.filter((p) => p.location === "BAG");
    const bank = pokemon.filter((p) => p.location === "BANK");

    return NextResponse.json({ bag, bank });
}

// POST /api/trainers/[id]/pokemon — assign a new pokemon to this trainer (goes to BANK)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const result = AssignPokemonSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { pokemonId, nickname, level, gender } = result.data;

    const trainerPokemon = await prisma.trainerPokemon.create({
        data: {
            trainerId: id,
            pokemonId,
            nickname,
            level: Number(level),
            gender,
            location: "BANK",
        },
        include: { pokemon: true },
    });

    return NextResponse.json(trainerPokemon, { status: 201 });
}
