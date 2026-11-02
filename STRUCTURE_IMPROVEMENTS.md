# What changed from the previous website version?

| Previous website | Improved website |
| --- | --- |
| All views inside one Portal.tsx | One file per URL route in `app/` |
| Layout mixed with business logic | Shared layout, AuthContext, SavedContext and hooks |
| Page buttons without shareable URLs | Direct links for Home, Browse, Report, Details, Dashboard, Claims and Admin |
| Detail popup with large nested content | Dedicated item detail page with related suggestions |
| Auth forms inside one stateful component | Separate Login, Signup, Forgot and Reset screens |
| Hard-to-debug combined state | Feature-specific state and reusable components |
| Basic homepage hierarchy | More visible CTAs, activity summary, 3-step process, latest reports |
| Limited mobile menu behavior | Responsive navigation + saved items + admin access |
| Few loading/error states | Clear errors, loading states, empty results, optional success notices |

**Data compatibility:** Same Supabase tables and storage policies as previous package. Existing records remain accessible if your current Supabase schema matches `supabase/schema.sql`.

**No false claims:** Source organized and syntax-checked offline. Must still run `npm install`, `npm run build`, and real end-to-end tests in your environment.
