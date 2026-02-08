import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { colors } from '../../theme';
import { icons, IconName } from '../../theme/icons';

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
    style?: any;
    fill?: string;
}

const Icon: React.FC<IconProps> = ({
    name,
    size = 24,
    color = colors.text.primary,
    strokeWidth = 2,
    style,
    fill
}) => {
    const iconPath = icons[name];

    if (!iconPath) {
        console.warn(`Icon "${name}" not found in registry.`);
        return null; // Or return a fallback question mark icon
    }

    // Check if the path string contains 'fill="currentColor"' to determine if we should use fill or stroke
    // Default Feather icons are stroke-based. Filled variants usually have fill="currentColor" and stroke="none"
    // But we are passing raw strings, so we need to wrap them in Svg.

    // Simplistic parser for our registry which returns full <path> strings or multiple elements
    // We will inject the string into Svg via dangerouslySetInnerHTML-like approach if we could, 
    // but React Native SVG doesn't support that easily for partial content without a wrapper.
    // Instead, we should probably format our registry to just be the `d` attribute if possible, OR
    // we use a parsing approach.

    // HOWEVER: For simplicity and performance, let's assume our registry returns the children of the Svg component.
    // We can't render string as children in RN-SVG. We need components.
    // Refactoring: The registry should probably return React Components or we use a transformer.
    // Let's change the pattern: The registry above returned strings. We need to render them.
    // A specific approach: Use SvgXml from react-native-svg if we want to use strings.
    // SvgXml is perfect for this.

    const xml = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
        ${iconPath}
      </svg>
    `;

    // Note: SvgXml does NOT inherit color well if we put it in the wrapper unless we use "currentColor" in standard SVGs.
    // Our registry has "currentColor".
    // We need to pass color to SvgXml? logic is tricky with xml strings.
    // Better approach:
    // We set the "stroke" and "fill" on the SVG wrapper.
    // For filled icons, they set fill="currentColor" which inherits from the parent text color usually, 
    // or we replace "currentColor" with the prop color.

    const svgXmlData = xml
        .replace(/currentColor/g, color);

    const { SvgXml } = require('react-native-svg');

    return <SvgXml xml={svgXmlData} width={size} height={size} style={style} />;
};

export default Icon;
