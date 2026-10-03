/**
 * Figma-side half of the token pipeline.
 *
 * The Figma Variables REST API is Enterprise-only, so variables are exported from inside the file
 * with the Plugin API. Run this snippet through the Figma MCP `use_figma` tool (or paste it into a
 * scratch plugin) on file xRB9FSPYbdup5v6rJz4R9F, save the returned JSON as
 * tokens/figma-variables.json and run `npm run tokens`.
 */
const toHex = (c) => {
  const h = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a === undefined || c.a >= 0.999 ? '' : h(c.a)}`;
};

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const byId = {};
for (const c of collections) {
  for (const id of c.variableIds) byId[id] = await figma.variables.getVariableByIdAsync(id);
}

const value = (variable, raw) =>
  raw && raw.type === 'VARIABLE_ALIAS'
    ? `{${byId[raw.id].name}}`
    : variable.resolvedType === 'COLOR'
      ? toHex(raw)
      : raw;

const out = { source: { fileKey: figma.fileKey, exportedAt: new Date().toISOString() }, collections: {} };
for (const c of collections) {
  const variables = {};
  for (const id of c.variableIds) {
    const v = byId[id];
    variables[v.name] = {
      type: v.resolvedType,
      values: Object.fromEntries(c.modes.map((m) => [m.name, value(v, v.valuesByMode[m.modeId])])),
    };
  }
  out.collections[c.name] = { modes: c.modes.map((m) => m.name), variables };
}

const weights = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };
out.textStyles = Object.fromEntries(
  (await figma.getLocalTextStylesAsync()).map((s) => [
    s.name,
    {
      family: s.fontName.family,
      weight: weights[s.fontName.style],
      size: s.fontSize,
      lineHeight: s.lineHeight.value,
      letterSpacing: +s.letterSpacing.value.toFixed(2),
      ...(s.textCase === 'UPPER' ? { textCase: 'UPPER' } : {}),
    },
  ]),
);

out.effectStyles = Object.fromEntries(
  (await figma.getLocalEffectStylesAsync()).map((s) => [
    s.name,
    s.effects.map((e) => {
      const bound = e.boundVariables?.color?.id;
      return {
        x: e.offset.x,
        y: e.offset.y,
        blur: e.radius,
        spread: e.spread ?? 0,
        color: bound ? `{${byId[bound].name}}` : toHex(e.color),
      };
    }),
  ]),
);

return out;
