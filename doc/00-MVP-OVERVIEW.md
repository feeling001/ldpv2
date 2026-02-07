# LDPv2 - MVP Overview

## Purpose
This MVP documentation package contains a complete breakdown of the LDPv2 project into iterative development stories following a "Walking Skeleton + Vertical Slices" approach.

## MVP Scope

The Minimum Viable Product focuses on delivering the core value proposition:
**"Manage applications, track their deployments across environments, and maintain deployment history"**

### What's IN the MVP
✅ Application management with lifecycle status  
✅ Environment management (flexible, production-ready)  
✅ Version tracking  
✅ Deployment recording and history  
✅ Current deployment state queries  
✅ Basic contact management  
✅ Business unit management  
✅ User authentication (local, JWT-based)  
✅ Basic role-based access control  

### What's OUT of the MVP (Phase 2+)
❌ External dependencies tracking  
❌ Data usage agreements  
❌ SLA management  
❌ Technical documentation links  
❌ Advanced reporting and dashboards  
❌ OAuth integration  
❌ Notification system  
❌ Advanced search and filtering  

## Development Approach

### Phase 0: Foundation (Walking Skeleton)
Establish the technical foundation and development patterns that will be replicated across all features.

**Duration**: 2-3 weeks  
**Goal**: Working authentication + 1 complete CRUD example

### Phase 1: Core Domain (Vertical Slices)
Deliver business value incrementally with complete end-to-end features.

**Duration**: 6-8 weeks  
**Goal**: Fully functional application and deployment tracking

### Phase 2: Enrichment (Future)
Add secondary features based on user feedback and business priorities.

## Story Structure

Each story follows this structure:
```
Story X: [Business Title]
├── Backend Development
│   ├── Database migration (Liquibase)
│   ├── JPA Entities
│   ├── Repository layer
│   ├── Service layer (business logic)
│   ├── DTOs (request/response)
│   ├── Controller (REST endpoints)
│   └── Tests (unit + integration)
├── Frontend Development
│   ├── TypeScript models/interfaces
│   ├── Angular service (HTTP client)
│   ├── Components (list, detail, form)
│   ├── Routing configuration
│   └── Tests (unit + e2e)
└── Acceptance Criteria
    └── Testable user scenarios
```

## Story Dependencies

```
Story 0 (Foundation)
    ├── Story 1 (Business Units) - Independent
    ├── Story 2 (Applications) - Depends on Story 1
    ├── Story 3 (Contacts) - Independent
    └── Story 4 (Environments) - Independent
        ├── Story 5 (Versions) - Depends on Story 2
        └── Story 6 (Deployments) - Depends on Stories 2, 4, 5
            └── Story 7 (Current State & History) - Depends on Story 6
```

## File Structure

```
ldpv2-mvp/
├── 00-MVP-OVERVIEW.md (this file)
├── 01-TECHNICAL-SETUP.md
├── stories/
│   ├── STORY-0-Foundation.md
│   ├── STORY-1-Business-Units.md
│   ├── STORY-2-Applications.md
│   ├── STORY-3-Contacts.md
│   ├── STORY-4-Environments.md
│   ├── STORY-5-Versions.md
│   ├── STORY-6-Deployments.md
│   └── STORY-7-Current-State-History.md
├── data-model/
│   ├── complete-data-model.ts
│   ├── mvp-entities-only.ts
│   └── database-schema.sql
└── api-specs/
    ├── openapi-mvp.yaml
    └── endpoint-summary.md
```

## Success Metrics

The MVP will be considered successful when:

1. **Functional Completeness**
   - All 8 stories are delivered and accepted
   - All acceptance criteria are met
   - Zero critical bugs

2. **Technical Quality**
   - Backend test coverage > 80%
   - Frontend test coverage > 70%
   - All APIs documented in Swagger
   - Code passes security audit

3. **User Satisfaction**
   - Users can perform core workflows without assistance
   - System performance meets requirements (<500ms API response)
   - Positive feedback from pilot users

4. **Business Value**
   - All applications are registered in the system
   - Deployment history is accurate and complete
   - Users prefer LDPv2 over previous tools/spreadsheets

## Timeline Estimate

| Phase | Duration | Stories |
|-------|----------|---------|
| Phase 0: Foundation | 2-3 weeks | Story 0 |
| Phase 1: Core (Batch 1) | 3-4 weeks | Stories 1-4 |
| Phase 1: Core (Batch 2) | 3-4 weeks | Stories 5-7 |
| **Total MVP** | **8-11 weeks** | **8 stories** |

*Note: Timeline assumes 1 full-time developer or 2 developers working part-time*

## Risk Mitigation

### Technical Risks
- **Database performance**: Addressed with indexing strategy in Story 0
- **JWT security**: Implemented following best practices in Story 0
- **Complex queries**: Deployment history queries optimized in Story 7

### Process Risks
- **Scope creep**: Strict adherence to MVP scope, Phase 2 features documented separately
- **Incomplete data**: Import tools and validation built into each entity story
- **User adoption**: Regular demos after each story completion

## Next Steps

1. Review this MVP overview
2. Read the Technical Setup guide
3. Begin with Story 0 (Foundation)
4. Follow stories in dependency order
5. Demo and gather feedback after every 2 stories

## Contact & Feedback

For questions or suggestions about this MVP plan, please contact the project team.

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Ready for Development
