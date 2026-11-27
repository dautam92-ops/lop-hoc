// Danh mục engine đã có code. Engine mới phải được đăng ký ở đây và trong registry/engines.json (S03-R07).
// Mã E07–E14 theo danh mục ENGINES của Giáo trình 2.0 (giao-trinh-2.0/src/banks.py), không tạo mã mới trùng.
import * as E00 from './e00-story.js';
import * as E01 from './e01-choose.js';
import * as E02 from './e02-match.js';
import * as E03 from './e03-sort.js';
import * as E04 from './e04-order.js';
import * as E05 from './e05-memory.js';
import * as E06 from './e06-find.js';
import * as E07 from './e07-maze.js';
import * as E08 from './e08-puzzle.js';
import * as E10 from './e10-branch.js';
import * as E11 from './e11-sim.js';
import * as E12 from './e12-sound.js';
import * as E13 from './e13-trace.js';
import * as E14 from './e14-create.js';
import * as E15 from './e15-follow.js';
import * as E16 from './e16-code.js';
import * as E17 from './e17-quick.js';

export const ENGINES = { E00, E01, E02, E03, E04, E05, E06, E07, E08, E10, E11, E12, E13, E14, E15, E16, E17 };
