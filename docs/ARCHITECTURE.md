# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │   Web (React)        │  │   Mobile (React Native)          │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
└────────────────┬─────────────────────────────────┬───────────────┘
                 │                                 │
         ┌───────▼────────────────────────────────▼────────┐
         │      API GATEWAY / LOAD BALANCER                │
         │  (Express.js / Kong / Nginx)                   │
         └───────┬─────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────────┬────────────┐
    │                         │                  │            │
┌───▼────────┐  ┌────────────▼─────┐  ┌────────▼────┐  ┌───▼────────┐
│  AUTH      │  │  SAFETY &        │  │  ITINERARY  │  │ COMMUNITY  │
│  SERVICE   │  │  SCAM SERVICE    │  │  SERVICE    │  │ SERVICE    │
└───┬────────┘  └────────┬─────────┘  └────────┬────┘  └───┬────────┘
    │                    │                     │           │
    └────────────────────┼─────────────────────┼───────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
    │PostgreSQL│  │   Redis    │  │   ElasticS.│
    │  +       │  │ (Caching & │  │  (Full     │
    │ PostGIS  │  │  Real-time)│  │  text S.)  │
    └──────────┘  └────────────┘  └────────────┘
        │              │                │
        └──────────────┼────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  EXTERNAL SERVICES          │
        │  ├─ Google Maps API         │
        │  ├─ OpenWeather API         │
        │  ├─ OpenAI/Claude API       │
        │  ├─ Geolocation Services    │
        │  └─ Payment Gateway         │
        └─────────────────────────────┘
```

## Microservices Architecture

### 1. **Authentication Service**
- User registration/login
- JWT token generation & validation
- OAuth2/Google Sign-in integration
- Password reset & 2FA
- Role-based access control (RBAC)

### 2. **Safety & Scam Service**
- Real-time safety alerts
- Crime hotspot analysis
- Scam database & detection
- Geolocation-based filtering
- Alert subscription management

### 3. **Itinerary Service**
- AI-powered itinerary generation
- Daily plan customization
- Route optimization
- Cost calculation & budget tracking
- Accessibility routing

### 4. **Community Service**
- User profiles & social graphs
- Reviews & ratings
- Travel experiences sharing
- Fellow traveler discovery
- Group management

### 5. **Notification Service**
- Push notifications
- Email alerts
- SMS alerts (critical)
- In-app notifications
- Alert preference management

## Database Schema (Simplified)

### Core Tables
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  username VARCHAR UNIQUE,
  profile_picture_url VARCHAR,
  preferences JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  country VARCHAR,
  city VARCHAR,
  coordinates POINT,
  timezone VARCHAR,
  created_at TIMESTAMP
);

-- Safety Alerts
CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  alert_type VARCHAR (crime|weather|health|scam),
  severity VARCHAR (low|medium|high|critical),
  title VARCHAR,
  description TEXT,
  radius_meters INT,
  coordinates POINT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Scams
CREATE TABLE scams (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  title VARCHAR,
  description TEXT,
  warning_signs TEXT[],
  prevention_tips TEXT[],
  reported_count INT,
  severity VARCHAR,
  created_at TIMESTAMP
);

-- Itineraries
CREATE TABLE itineraries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  location_id UUID REFERENCES locations(id),
  title VARCHAR,
  days INT,
  budget_usd DECIMAL,
  interests TEXT[],
  generated_by VARCHAR (ai|manual),
  activities JSONB,
  total_distance_km DECIMAL,
  created_at TIMESTAMP
);

-- Places
CREATE TABLE places (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  name VARCHAR,
  category VARCHAR (restaurant|shop|attraction|service),
  description TEXT,
  rating DECIMAL(2,1),
  reviews_count INT,
  coordinates POINT,
  is_verified BOOLEAN,
  created_at TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  place_id UUID REFERENCES places(id),
  rating INT (1-5),
  comment TEXT,
  is_safe BOOLEAN,
  created_at TIMESTAMP
);
```

## API Design Patterns

### RESTful Conventions
```
GET    /api/v1/resource              - List resources
GET    /api/v1/resource/:id          - Get single resource
POST   /api/v1/resource              - Create resource
PUT    /api/v1/resource/:id          - Update resource
DELETE /api/v1/resource/:id          - Delete resource
```

### Response Format
```json
{
  "success": true,
  "data": { },
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

## Caching Strategy

### Redis Cache Layers
1. **User Sessions** - 24 hours TTL
2. **Location Data** - 7 days TTL
3. **Safety Alerts** - Real-time (event-driven)
4. **Place Ratings** - 24 hours TTL
5. **Itinerary Cache** - 48 hours TTL

### Cache Invalidation
- Event-driven invalidation via message queues
- Time-based expiration (TTL)
- Manual invalidation for critical data

## Geospatial Queries

### PostGIS Features
```sql
-- Find safety hotspots within 5km radius
SELECT * FROM safety_hotspots 
WHERE ST_DWithin(coordinates, ST_GeomFromText('POINT(...)'), 5000);

-- Calculate distance between two points
SELECT ST_Distance(point1, point2) as distance_meters 
FROM locations;

-- Find nearby places
SELECT * FROM places 
WHERE coordinates <-> user_location < '5 km' 
ORDER BY coordinates <-> user_location;
```

## Authentication Flow

```
┌─────────┐                         ┌──────────────┐
│ Client  │                         │ Auth Service │
└────┬────┘                         └──────┬───────┘
     │                                     │
     │ POST /auth/login                    │
     │─────────────────────────────────→ │
     │                                     │
     │ Validate credentials                │
     │ Generate JWT token                  │
     │                                     │
     │← ────────────────────────────────── │
     │    {token, refreshToken}            │
     │                                     │
     │ Subsequent requests with JWT        │
     │─────────────────────────────────→ │
     │   Headers: Authorization: Bearer... │
```

## Real-Time Safety Alerts

### Event Stream Architecture
```
Safety Events → Message Queue → WebSocket Server → Connected Clients
    (Producer)     (RabbitMQ/       (Socket.IO)      (Browsers/Mobile)
                   Redis Streams)
```

### WebSocket Events
```javascript
// Subscribe to location alerts
socket.on('subscribe:alerts', { locationId, radius: 5000 });

// Receive real-time alerts
socket.on('alert:new', {
  type: 'crime',
  severity: 'high',
  title: 'Theft reported in area',
  coordinates: { lat, lng },
  distance_meters: 1500
});
```

## Deployment Architecture

### Containerization
```
Docker Images:
├─ backend-api
├─ frontend-web
├─ postgres
├─ redis
└─ nginx (reverse proxy)
```

### Cloud Deployment (AWS Example)
```
Internet Gateway
       ↓
   ALB (Load Balancer)
       ↓
   ┌───┴───┐
   │       │
  ECS    ECS  (API Containers)
  Pod1   Pod2
   │       │
   └───┬───┘
       ↓
    RDS PostgreSQL + PostGIS
       ↓
    ElastiCache (Redis)
       ↓
    S3 (Static Assets)
```

## Monitoring & Logging

### Stack
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger / OpenTelemetry
- **Uptime**: StatusPage / Pingdom
- **Error Tracking**: Sentry

### Key Metrics
- API response time (p50, p95, p99)
- Error rate & error types
- Database query performance
- Cache hit rate
- WebSocket connections
- Real-time alert latency

## Security Considerations

1. **Data Protection**
   - HTTPS/TLS everywhere
   - Database encryption at rest
   - Sensitive data hashing (passwords, tokens)

2. **API Security**
   - Rate limiting per endpoint & user
   - Input validation & sanitization
   - CORS configuration
   - SQL injection prevention (parameterized queries)

3. **Authentication**
   - JWT with expiration
   - Refresh token rotation
   - Multi-factor authentication option

4. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - Audit logging for sensitive operations

## Scalability Considerations

1. **Database**
   - Read replicas for read-heavy queries
   - Partitioning by location/date
   - Connection pooling

2. **API**
   - Horizontal scaling with load balancer
   - Stateless design for easy scaling
   - API versioning for backward compatibility

3. **Caching**
   - Multi-level caching strategy
   - Cache warming for popular queries
   - Redis clustering for high throughput

4. **Real-time**
   - WebSocket server clustering
   - Pub/Sub for cross-server communication
   - Connection pooling

---

This architecture is designed to be scalable, maintainable, and resilient to handle growing user base and data volumes.
