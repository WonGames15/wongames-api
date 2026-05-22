export function mapRating(rating: string) {
  if (!rating) return "BR0";

  if (rating.includes("18") || rating.includes("esrbm")) return "BR18";
  if (rating.includes("16")) return "BR16";
  if (rating.includes("14")) return "BR14";
  if (rating.includes("12")) return "BR12";
  if (rating.includes("10")) return "BR10";

  return "BR0";
}

export function Exception(e: any) {
  return {
    error: e?.message || e,
    data: e?.data?.errors,
  };
}

export function mergeDeep(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
