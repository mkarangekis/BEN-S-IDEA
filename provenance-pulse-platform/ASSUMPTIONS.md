# Assumptions

This document lists assumptions made during the development of the Provenance Pulse Platform.

## Architecture Assumptions

1. **Monorepo Structure**: Using a single repository with workspaces for better code sharing and simpler deployment, rather than separate repositories for each service.

2. **Single Database**: Both Auction Pulse and Luxury Pulse share the same PostgreSQL database with tenant isolation via `tenantId` foreign keys. This simplifies infrastructure but requires careful query scoping.

3. **JWT Authentication**: Using stateless JWT tokens for API authentication. Refresh tokens are generated but token blacklisting is not implemented (would require Redis storage for production).

4. **ML Service Separation**: The ML service runs as a separate Python/FastAPI service to allow for easier model deployment and GPU utilization in production.

## Data Model Assumptions

5. **Tenant Type Lock**: Each tenant is locked to either AUCTION_PULSE or LUXURY_PULSE at creation time. There's no mechanism to switch or have both.

6. **User Single-Tenant**: Users belong to exactly one tenant. Multi-tenant users would require a separate join table.

7. **Soft Delete**: No soft deletes implemented. For production, consider adding `deletedAt` timestamps to key entities.

8. **Audit Log Retention**: Audit logs are stored indefinitely. Production should implement retention policies.

9. **Image Storage**: Image URLs are stored as string arrays. Actual image upload and CDN integration is not implemented.

## ML/AI Assumptions

10. **Mock Predictions**: All ML endpoints return deterministic mock predictions based on simple rules and randomization. These must be replaced with actual models for production.

11. **Synchronous Predictions**: ML predictions are synchronous. For production, consider async prediction queues for expensive models.

12. **No Model Versioning**: No infrastructure for A/B testing or model versioning. Would need MLflow or similar for production.

13. **SHAP/Explainability**: Feature flags mentioned for explainability are stubs only.

## Frontend Assumptions

14. **Local Storage Auth**: Auth tokens stored in localStorage for simplicity. Consider httpOnly cookies for production security.

15. **No SSR Authentication**: Authentication checks happen client-side only. Server-side auth checks would improve security.

16. **Basic Error Handling**: Minimal error handling and retry logic. Production needs comprehensive error boundaries and retry mechanisms.

17. **No Pagination**: List endpoints return all results. Production needs cursor-based pagination.

## Integration Assumptions

18. **CRM/Marketplace Connectors**: Integration module contains stubs only. Actual OAuth flows, webhooks, and sync logic need implementation.

19. **Email/Notifications**: Engagement workflows create events but don't send actual emails. Needs email service integration (SendGrid, etc.).

20. **Bidding Engine**: No real-time bidding integration. Would need WebSocket or SSE for live auction updates.

## Security Assumptions

21. **Role-Based Access**: Basic RBAC with predefined roles. Fine-grained permissions (resource-level ACLs) not implemented.

22. **No Rate Limiting**: API rate limiting not implemented. Use nginx or API gateway in production.

23. **CORS Open**: CORS allows all origins in development. Must restrict in production.

24. **No Input Sanitization**: Basic validation only. Production needs XSS prevention and SQL injection protection beyond Prisma's defaults.

## Infrastructure Assumptions

25. **Single Region**: No consideration for multi-region deployment or data residency requirements.

26. **No Caching**: Redis is available but caching is not implemented for API responses.

27. **No Health Checks**: Basic health endpoint only. Production needs comprehensive health checks for all dependencies.

28. **No Monitoring**: No metrics, tracing, or alerting configured. Needs Prometheus, Grafana, or similar.

29. **Kubernetes Basic**: K8s manifests are basic examples. Production needs:
    - ConfigMaps and Secrets management
    - Ingress configuration
    - Resource quotas
    - Network policies
    - Pod disruption budgets

## Business Logic Assumptions

30. **Currency**: All prices assumed to be in USD. Multi-currency support not implemented.

31. **Timezone**: All dates stored in UTC. Timezone conversion handled by frontend.

32. **Tax/Fees**: No buyer's premium, taxes, or fees calculations. Would need per-jurisdiction logic.

33. **Compliance**: No GDPR/CCPA data subject rights implementation.

34. **Historical Data**: No time-series storage for predictions or metrics. Would need TimescaleDB or similar for analytics.

## Future Considerations

These assumptions identify areas for enhancement before production deployment:

1. Implement proper authentication with secure cookies
2. Add comprehensive error handling and logging
3. Replace mock ML models with trained models
4. Add pagination to all list endpoints
5. Implement caching strategy
6. Add comprehensive monitoring and alerting
7. Implement proper secrets management
8. Add integration tests and E2E tests
9. Set up CI/CD pipeline
10. Conduct security audit
