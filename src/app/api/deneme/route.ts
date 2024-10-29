// route.ts veya sunucu tarafı kodu
import { NextRequest, NextResponse } from "next/server";
import { createWriteStream, mkdirSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const files = data.getAll("files") as File[];

        for (const file of files) {
            // Dosyanın göreli yolunu al
            const relativePath = (file as any).webkitRelativePath;
            const savePath = path.join("/hedef/dizin", relativePath);

            // Klasörleri oluştur
            const dir = path.dirname(savePath);
            mkdirSync(dir, { recursive: true });

            // Dosyayı kaydet
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(savePath, fileBuffer);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Dosyalar yüklenemedi." },
            { status: 500 }
        );
    }
}
