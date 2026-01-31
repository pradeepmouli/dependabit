# Expected Dependencies for Test Fixture

This file documents the expected dependencies that should be detected by Dependabit
in this test fixture repository. Used for validating SC-001 (90%+ accuracy requirement).

## Expected Detections (15 total)

### From README.md (13 dependencies)

1. **react.dev/learn** (Type: documentation, Access: http)
2. **typescriptlang.org/docs/handbook** (Type: documentation, Access: http)
3. **developer.mozilla.org/en-US/docs/Web/API** (Type: documentation, Access: http)
4. **arxiv.org/abs/1706.03762** (Type: research-paper, Access: arxiv)
5. **arxiv.org/abs/1810.04805** (Type: research-paper, Access: arxiv)
6. **swagger.io/specification** (Type: schema, Access: openapi)
7. **spec.graphql.org** (Type: schema, Access: http)
8. **github.com/expressjs/express** (Type: reference-implementation, Access: github-api)
9. **github.com/tiangolo/fastapi** (Type: reference-implementation, Access: github-api)
10. **json-schema.org/draft/2020-12/schema** (Type: schema, Access: http)
11. **protobuf.dev** (Type: documentation, Access: http)
12. **docs.docker.com** (Type: documentation, Access: http)
13. **kubernetes.io/docs/reference** (Type: documentation, Access: http)

### From src/api-client.ts (4 dependencies - may overlap with README)

14. **restfulapi.net** (Type: documentation, Access: http)
15. **developer.mozilla.org/en-US/docs/Web/HTTP/Status** (Type: documentation, Access: http)
16. **developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET** (Type: documentation, Access: http)
17. **github.com/axios/axios** (Type: reference-implementation, Access: github-api)
18. **restfulapi.net/rest-architectural-constraints** (Type: documentation, Access: http)

### From src/ml_model.py (2 dependencies - overlap with README)

19. **pytorch.org/docs/stable/nn.html** (Type: documentation, Access: http)
20. **pytorch.org/tutorials** (Type: documentation, Access: http)
21. **numpy.org/doc/stable/reference** (Type: documentation, Access: http)

## Minimum Acceptance Criteria

- **Total unique URLs**: ~18-21 (accounting for duplicates)
- **Required accuracy**: 90%+ (at least 16-19 dependencies correctly identified)
- **Detection methods**: Mix of programmatic parsing and LLM analysis
- **Confidence scores**: Programmatic matches should have 0.9, LLM matches 0.5

## Type Distribution

- Documentation: ~11-13
- Research papers: 2
- Schemas: 3
- Reference implementations: 3-4

## Access Method Distribution

- http: ~12-15
- arxiv: 2
- github-api: 3-4
- openapi: 1
