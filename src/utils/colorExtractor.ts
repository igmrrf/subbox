export async function extractColors(imageSrc: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const colorMap: Record<string, number> = {};

      // Sample pixels (step by 5 to save performance)
      for (let i = 0; i < data.length; i += 4 * 5) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip transparent or very dark/light pixels
        if (a < 128 || (r < 20 && g < 20 && b < 20) || (r > 240 && g > 240 && b > 240)) continue;

        const rgb = `${r},${g},${b}`;
        colorMap[rgb] = (colorMap[rgb] || 0) + 1;
      }

      // Sort colors by frequency
      const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5
        .map(([rgb]) => `rgb(${rgb})`);

      resolve(sortedColors);
    };

    img.onerror = (e) => reject(e);
  });
}
