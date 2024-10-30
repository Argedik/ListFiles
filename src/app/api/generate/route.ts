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
        const relativePath = path
            .relative(directoryPath, fullPath)
            .replace(/\\/g, "/");

        const stat = fs.statSync(fullPath);

        // Dosya veya klasör ismini alıyoruz
        const fileName = path.basename(fullPath);

        // Hariç tutma kontrolü
        let isExcluded = false;

        for (const excludeItem of excludeList) {
            const normalizedExcludeItem = excludeItem.replace(/\\/g, "/");

            if (normalizedExcludeItem.includes("/")) {
                // Eğer excludeItem bir yol ise
                if (
                    relativePath === normalizedExcludeItem ||
                    relativePath.startsWith(normalizedExcludeItem + "/")
                ) {
                    isExcluded = true;
                    break;
                }
            } else {
                // Eğer excludeItem bir dosya veya klasör ismi ise
                if (fileName === normalizedExcludeItem) {
                    isExcluded = true;
                    break;
                }
            }
        }

        if (isExcluded) {
            // Hariç tutulan dosya veya klasör
            return;
        }

        if (stat.isDirectory()) {
            // Klasörse, alt klasörleri tara
            listFiles(fullPath, excludeList, fileList);
        } else {
            // Dosyaysa, listeye ekle
            fileList.push(fullPath);
        }
    });

    return fileList;
}

let directoryPath: string; // Global değişken

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log(body);
        const {
            directoryPath: dirPath,
            selectedLanguages = [],
            additionalExcludes = [],
        } = body;

        directoryPath = dirPath; // Global değişkene atadık

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
            General: [
                ".git",
                ".gitignore",
                "front-end/.next",
                "front-end/public",
                "front-end/next-env.d.ts",
                "front-end/next.config.mjs",
                "front-end/README.md",
                "front-end/tsconfig.json",
                "listFiles.js",
                "project_files.txt",
                "back-end/target",
                "back-end/Cargo.lock",
                "back-end/Cargo.toml",
                "back-end/migrations",
                "node_modules",
            ],
            JavaScript: ["package.json", "package-lock.json"],
            Rust: ["target", "Cargo.lock", "Cargo.toml", "migrations"],
            "C#": ["bin", "obj", "*.csproj", "*.sln"],
            Diesel: ["migrations"],
        };

        // Seçilen dillere göre hariç tutmaları birleştirin
        let combinedExcludes = [...languageExcludePatterns["General"]]; // Genel hariç tutmaları ekle

        selectedLanguages.forEach((lang: string) => {
            combinedExcludes = combinedExcludes.concat(
                languageExcludePatterns[lang] || []
            );
        });

        // Ek hariç tutmaları ekleyin
        combinedExcludes = combinedExcludes.concat(additionalExcludes);

        // Exclude Listesindeki Yolları Normalize Ediyoruz
        combinedExcludes = combinedExcludes.map((p) => p.replace(/\\/g, "/"));

        // Dosya listesini oluşturun
        const files = listFiles(directoryPath, combinedExcludes);

        console.log(files);
        // txt dosyasını dizine yazın
        const txtFilePath = path.join(directoryPath, "project_files.txt");
        console.log(txtFilePath);
        fs.writeFileSync(txtFilePath, files.join("\n"));

        // İşlem başarılı olduğunda toplam dosya sayısını belirtin
        const totalFiles = files.length;
        console.log(`Toplam dosya sayısı: ${totalFiles}`);

        // Başarılı yanıt döndürün
        return new Response(JSON.stringify({ success: true, totalFiles }), {
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
