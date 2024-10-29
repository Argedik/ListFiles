// C:\Users\enes.gedik\Desktop\fe\listfiles\src\app\api\generate\route.ts

import fs from "fs";
import path from "path";

function listFiles(
    dirPath: string,
    excludeList: string[],
    fileList: string[] = []
): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        // Dosya yolunun excludeList'teki herhangi bir öğeyi içerip içermediğini kontrol et
        const isExcluded = excludeList.some((excludePath) =>
            fullPath.includes(excludePath)
        );

        if (stat.isDirectory()) {
            if (!isExcluded) {
                // Eğer klasör exclude listesinde değilse alt klasörleri tara
                listFiles(fullPath, excludeList, fileList);
            }
        } else {
            if (!isExcluded) {
                // Eğer dosya exclude listesinde değilse ekle
                fileList.push(fullPath);
            }
        }
    });

    return fileList;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log(body);
        const {
            directoryPath,
            selectedLanguages = [],
            additionalExcludes = [],
        } = body;

        // Gelen dizin yolunun var olup olmadığını kontrol edin
        if (!fs.existsSync(directoryPath)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Girilen dizin yolu mevcut değil.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Dil bazlı hariç tutma desenlerini tanımlayın
        const languageExcludePatterns: { [key: string]: string[] } = {
            JavaScript: [
                "node_modules",
                ".js",
                ".jsx",
                "package.json",
                "package-lock.json",
            ],
            Rust: ["target", "Cargo.lock", "Cargo.toml", "migrations", ".rs"],
            "C#": ["bin", "obj", ".csproj", ".sln", ".cs"],
            Diesel: ["migrations"],
        };

        // Seçilen dillere göre hariç tutmaları birleştirin
        let combinedExcludes = [".git"]; // Her zaman .git'i hariç tut
        selectedLanguages.forEach((lang: string) => {
            combinedExcludes = combinedExcludes.concat(
                languageExcludePatterns[lang] || []
            );
        });
        combinedExcludes = combinedExcludes.concat(additionalExcludes);

        // Dosya listesini oluşturun
        const files = listFiles(directoryPath, combinedExcludes);

        // txt dosyasını dizine yazın
        const txtFilePath = path.join(directoryPath, "project_files.txt");
        fs.writeFileSync(txtFilePath, files.join("\n"));

        // Başarılı yanıt döndürün
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        // Hata yanıtı döndürün
        return new Response(
            JSON.stringify({
                success: false,
                message: "Dosyalar oluşturulurken bir hata oluştu.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
