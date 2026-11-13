/** The home page as a program: the bytes the machine view prints, served whole. */
import { home } from '../_machine';
export const GET = () => new Response(home.bytes, { headers: { 'content-type': 'application/octet-stream' } });
