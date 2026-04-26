<script>
import Icon from '@iconify/css-svelte';
import { namedStateValue } from './helpers/named-state-value.js';
import { getFallback } from './helpers/fallback-ay9wndypfp.js';
import './css/u2mluk.css';
import './css/ona74n.css';
import './css/b6dtxa.css';
import './css/so-from-74.css';
import './css/so-to-0.css';

/** @type {{halign?: 'left' | 'center' | 'right'; valign?: 'top' | 'middle' | 'bottom' | 'stretch'; focus?: boolean; static?: boolean; width?: string; height?: string;}} */
let {halign: halignProp, valign: valignProp, focus: focusProp, static: staticProp, width: widthProp, height: heightProp, ...props} = $props();

let states = $derived(({ 'halign': namedStateValue(halignProp, 'left'), 'valign': namedStateValue(valignProp, 'top'), 'focus': focusProp, 'static': staticProp }));
let fallback = $derived(getFallback(["animated-line-24:align-box-",{"state":"halign"},"-",{"state":"valign"}],states));
let className = $derived(Object.entries(states).map(([key, value]) => value ? `state-${value === true ? key : value}` : '').join(' ').trim() || undefined);
const viewBox = {"width":22,"height":24};
const content = `<path class="ona74n u2mluk"/><path class="b6dtxa ona74n"/>`;
</script>
<Icon class={className} width={widthProp} height={heightProp} viewBox={viewBox} content={content} fallback={fallback} {...props}></Icon>
