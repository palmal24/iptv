import fetch from 'node-fetch';
import * as fs from 'fs';

const linksFile = fs.readFileSync("list1.m3u8", "utf-8").split("\n");
let urls: string[] = [];
let invalidUrls: string[] = [];

async function fetchUrl(url: string, timeout: number = 5000): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { method: 'GET', signal: controller.signal });

        clearTimeout(timer);
        console.log(`${response.status} ${response.ok} - ${url}`);
        if (response.status != 200) {
            throw("Non working url")
        }
        return true;
    } catch (error: any) {
        clearTimeout(timer);

        if (error.name === 'AbortError') {
            console.error(`Timeout (${timeout}ms) for URL: ${url}`);
        } else {
            console.error(`Invalid URL: ${url} - ${error}`);
        }

        invalidUrls.push(url);
        return false;
    }
}

async function checkLinks() {
    urls = linksFile
        .filter(line => line.startsWith("http"))
        .map(line => line.trim());

    for (const streamUrl of urls) {
        await fetchUrl(streamUrl, 6000);
    }

    if (invalidUrls.length > 0) {
        console.error(`Total ${invalidUrls.length} found. Remove or update:`)
        invalidUrls.forEach(url => {
            console.log(url);
        });
        // await new Promise(resolve => setTimeout(resolve, 5000));
        console.error("Exiting...");
        process.exit(1);
    }
    console.log("Script finished");
}

checkLinks();
