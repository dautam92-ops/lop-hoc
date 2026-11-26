// Danh mục engine đã có code. Engine mới phải được đăng ký ở đây và trong registry/engines.json (S03-R07).
import * as E00 from './e00-story.js';
import * as E01 from './e01-choose.js';
import * as E02 from './e02-match.js';
import * as E03 from './e03-sort.js';
import * as E04 from './e04-order.js';
import * as E05 from './e05-memory.js';
import * as E06 from './e06-find.js';
import * as E15 from './e15-follow.js';

export const ENGINES = { E00, E01, E02, E03, E04, E05, E06, E15 };
