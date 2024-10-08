import { TinyColor } from '@ctrl/tinycolor';

export const colors1 = ['#6253E1', '#04BEFE'];
export const colors2 = ['#fc6076', '#ff9a44', '#ef9d43', '#e75516'];
export const colors3 = ['#40e495', '#30dd8a', '#2bb673'];

export const getHoverColors = (colors) => colors.map((color) => new TinyColor(color).lighten(5).toString());
export const  getActiveColors = (colors) => colors.map((color) => new TinyColor(color).darken(5).toString());
