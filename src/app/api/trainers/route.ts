import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateTrainerSchema } from "@/lib/schemas";

// GET /api/trainers — list all trainers
export async function GET() {
    const trainers = await prisma.trainer.findMany({
        orderBy: { name: "asc" },
    });
    return NextResponse.json(trainers);
}

// POST /api/trainers — create a new trainer
export async function POST(req: NextRequest) {
    const body = await req.json();
    const result = CreateTrainerSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { name, gender, age } = result.data;
    const trainer = await prisma.trainer.create({
        data: { name, gender, age },
    });
    return NextResponse.json(trainer, { status: 201 });
}
