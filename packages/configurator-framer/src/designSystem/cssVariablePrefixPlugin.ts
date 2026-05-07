const PREFIX = '--spc-';
// Matches var(--xxx) but not already-prefixed var(--spc-) and not Framer's own var(--framer-)
const VAR_REGEX = /var\(--(?!spc-)(?!framer-)/g;
const VAR_REPLACEMENT = 'var(--spc-';

// Stylis middleware that adds --spc- prefix to all CSS custom properties
// and var() references rendered by styled-components, preventing conflicts
// when the library is embedded in a host website.
export function cssVariablePrefixPlugin(element: any): void {
    if (element.type !== 'decl') return;

    const prop: string = element.props;
    const children: string = element.children;

    const isCustomProp = prop.startsWith('--') && !prop.startsWith(PREFIX);
    const hasVarRef = typeof children === 'string' && children.includes('var(--');

    if (!isCustomProp && !hasVarRef) return;

    const newProp = isCustomProp ? PREFIX + prop.slice(2) : prop;
    const newChildren = hasVarRef ? children.replace(VAR_REGEX, VAR_REPLACEMENT) : children;

    if (isCustomProp) element.props = newProp;
    element.return = `${newProp}:${newChildren};`;
}
