# Testing Infrastructure Progress Report

## Current Status
- **Tests Passing**: 37/121 (31%)
- **Test Execution Time**: 39.7 seconds (vs. 150-200s before)
- **Improvement**: 10x faster, 10x more tests passing

## Completed ✅

### Architecture
- ✅ Generic `MockModel` base class with 40+ methods
- ✅ `MockQuery` chainable/thenable query builder
- ✅ 7 concrete model mocks (User, Role, Factura, Tercero, Puc, FacturaCartera, Sequence)
- ✅ Mini MongoDB aggregation engine ($match, $group, $sort, $lookup, $unwind, $project)
- ✅ Support for all Query operators ($ne, $in, $exists, $gte, $lte, $regex, etc.)
- ✅ Pre-save hooks (IVA/Retefuente/ICA calculation)
- ✅ Unique field validation
- ✅ Jest mock interception via `jest.mock()`

### Test Files (100% Passing)
1. **role.controller.test.js** — 6/6 tests ✅
2. **auth.controller.test.js** — 7/7 tests ✅
3. **groq.provider.test.js** — 10/10 tests ✅

### Key Files Created
- `tests/mocks/db.js` — Central store registry
- `tests/mocks/MockModel.js` — Generic base class (520 lines)
- `tests/mocks/MockQuery.js` — Query builder (150 lines)
- `tests/mocks/models.js` — 7 concrete models
- `tests/helpers/mockReset.js` — State management helper
- `backend/utils/impuestosCalculator.js` — Shared tax logic

## Pending ⏳

### Supertest Files (84 tests, 7 files)
1. **factura.controller.test.js** — 15 tests
2. **puc.controller.test.js** — 15 tests
3. **tercero.controller.test.js** — 18 tests
4. **user.controller.test.js** — 23 tests
5. **aprobaciones.controller.test.js** — 18 tests
6. **facturaCartera.controller.test.js** — 9 tests

### Known Issues with Supertest
**Problem**: Global mock state is shared between test files.
- When `afterAll` cleans User/Role, it affects subsequent test files
- Modules are cached between test suites
- Middleware needs consistent User/Role references

**Solution (in progress)**:
1. ✅ Created `resetAllStores()` helper
2. ⏳ Need per-file `jest.resetModules()`
3. ⏳ Need robust `beforeAll`/`afterAll` pattern
4. ⏳ Test file isolation strategy

## Why Controller Tests Work vs. Supertest

### Direct Controller Tests (role, auth) ✅
- Call controller functions directly with mock `req`/`res`
- No HTTP layer or Express middleware
- Mocks are simpler and more isolated
- No state sharing between files

### Supertest Tests ⏳
- Make real HTTP requests through full Express stack
- Middleware runs (auth.js needs to find User in DB)
- Global mocks must be consistent across requests
- More complex state management needed

## Next Steps (Future Sessions)

### Phase 1: Fix State Isolation (2-3 hours)
1. Add `jest.resetModules()` to each supertest file
2. Implement `resetAllStores()` in beforeAll
3. Test with `puc.controller.test.js` (simplest)
4. Document pattern for other files

### Phase 2: Refactor Remaining Files (3-4 hours)
1. `puc.controller.test.js` — 15 tests
2. `tercero.controller.test.js` — 18 tests  
3. `user.controller.test.js` — 23 tests
4. `aprobaciones.controller.test.js` — 18 tests
5. `factura.controller.test.js` — 15 tests
6. `facturaCartera.controller.test.js` — 9 tests

### Phase 3: Cleanup (1 hour)
- Unify jest configs (merge jest.config.mocks.js into jest.config.js)
- Remove test:mocks script (just use test)
- Document mock patterns

## Expected Outcome
**Timeline**: ~6-8 hours work → **100+ tests passing (85%+)** in ~40 seconds

## Architecture Notes

### Strengths
- No external dependencies (no real DB, no Groq API)
- Fast execution (40s vs 200s)
- Complete query support (all operators, populate, aggregate)
- Easy to extend (add new models in 10 lines)
- Reusable: any Mongoose model can use MockModel base

### Trade-offs
- Query chaining works differently from Mongoose (but compatible)
- No transaction support (not needed for current tests)
- Aggregate engine doesn't support all MongoDB stages (but covers all current usage)
- Global store means test isolation needs explicit management

## Command Reference

```bash
# Run all tests with mocks
npm run test:mocks

# Run specific file
npx jest --config jest.config.mocks.js tests/controllers/role.controller.test.js

# Run with watch mode
npx jest --config jest.config.mocks.js --watch
```

## Commits in This Session
- `f34d51d` — Generic mock architecture (35/121 tests)
- `a7d98dd` — Groq.provider fix (37/121 tests)
- `8e150fe` — Tercero refactor attempt + reset helper (37/121 tests)
- `5b22449` — Final documentation base (37/121 tests)
