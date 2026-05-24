import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MovePokemonSchema } from "@/lib/schemas";

// PATCH /api/trainer-pokemon/[id]/move — move a pokemon between BAG and BANK
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const result = MovePokemonSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { destination } = result.data;

    // If moving to BAG, enforce the 6-pokemon limit
    if (destination === "BAG") {
        const current = await prisma.trainerPokemon.findUnique({
            where: { id },
            select: { trainerId: true },
        });

        if (!current) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const bagCount = await prisma.trainerPokemon.count({
            where: { trainerId: current.trainerId, location: "BAG" },
        });

        if (bagCount >= 6) {
            return NextResponse.json(
                { error: "Bag is full — maximum 6 Pokémon allowed" },
                { status: 409 }
            );
        }
    }

    const updated = await prisma.trainerPokemon.update({
        where: { id },
        data: { location: destination },
        include: { pokemon: true },
    });

    return NextResponse.json(updated);
}
