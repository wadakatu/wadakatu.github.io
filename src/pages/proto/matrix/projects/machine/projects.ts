/** The projects page as a program: the bytes the machine view prints, served whole. */
import { projectsFile } from '../../_machine';
export const GET = () => new Response(projectsFile.bytes, { headers: { 'content-type': 'application/octet-stream' } });
