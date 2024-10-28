import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Data = {
    success: boolean;
    message?: string;
};

function listFiles(
    dirPath: string,
    excludeList: string[],
    fileList: string[] = []
): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        const isExcluded = excludeList.some((excludePath) =>
            fullPath.includes(excludePath)
        );

        if (stat.isDirectory()) {
            if (!isExcluded) {
                listFiles(fullPath, excludeList, fileList);
            }
        } else {
            if (!isExcluded) {
                fileList.push(fullPath);
            }
        }
    });

    return fileList;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === "POST") {
        const { directoryPath, selectedLanguages, additionalExcludes } =
            req.body;

        // Define exclude patterns for each language
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
            Diesel: ["migrations"], // Assuming Diesel is a Rust ORM
        };

        // Combine excludes based on selected languages
        let combinedExcludes = [".git"]; // Always exclude .git
        selectedLanguages.forEach((lang: string) => {
            combinedExcludes = combinedExcludes.concat(
                languageExcludePatterns[lang] || []
            );
        });
        combinedExcludes = combinedExcludes.concat(additionalExcludes || []);

        try {
            // Generate the list of files
            const files = listFiles(directoryPath, combinedExcludes);

            // Write the JS file into the directory
            const jsFilePath = path.join(
                directoryPath,
                "file_list_generator.js"
            );
            const jsFileContent = `// Auto-generated file listing script
${listFiles.toString()}

const files = listFiles('${directoryPath}', ${JSON.stringify(
                combinedExcludes
            )});
console.log(files.join('\\n'));
`;

            fs.writeFileSync(jsFilePath, jsFileContent);

            // Write the txt file into the directory
            const txtFilePath = path.join(directoryPath, "project_files.txt");
            fs.writeFileSync(txtFilePath, files.join("\n"));

            res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error generating files.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
}
