# Database Schema

Comprehensive documentation of the database schema for the AI Tourist Safety Assistant.

## Tables

### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  profile_picture_url VARCHAR(500),
  bio TEXT,
  preferences JSONB,
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Locations

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  state_province VARCHAR(100),
  coordinates GEOMETRY(Point, 4326),
  timezone VARCHAR(50),
  description TEXT,
  population INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_country_city ON locations(country, city);
CREATE INDEX idx_locations_coordinates ON locations USING GIST (coordinates);
```

### Safety Alerts

```sql
CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  radius_meters INTEGER,
  coordinates GEOMETRY(Point, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_alerts_location ON safety_alerts(location_id);
CREATE INDEX idx_alerts_coordinates ON safety_alerts USING GIST (coordinates);
CREATE INDEX idx_alerts_type ON safety_alerts(alert_type);
```

### Scams

```sql
CREATE TABLE scams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  warning_signs TEXT[],
  prevention_tips TEXT[],
  reported_count INTEGER DEFAULT 0,
  severity VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scams_location ON scams(location_id);
CREATE INDEX idx_scams_category ON scams(category);
```

### Places

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  coordinates GEOMETRY(Point, 4326),
  address VARCHAR(500),
  phone VARCHAR(20),
  website VARCHAR(500),
  opening_hours JSONB,
  rating DECIMAL(3,2),
  reviews_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN,
  accepts_cards BOOLEAN,
  avg_cost_usd DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_places_location ON places(location_id);
CREATE INDEX idx_places_coordinates ON places USING GIST (coordinates);
CREATE INDEX idx_places_category ON places(category);
```

### Itineraries

```sql
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID REFERENCES locations(id),
  title VARCHAR(255),
  description TEXT,
  days INTEGER,
  budget_usd DECIMAL(10,2),
  interests TEXT[],
  mobility VARCHAR(50),
  travel_pace VARCHAR(50),
  activities JSONB,
  total_distance_km DECIMAL(10,2),
  generated_by VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX idx_itineraries_user ON itineraries(user_id);
CREATE INDEX idx_itineraries_location ON itineraries(location_id);
```

### Reviews

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  place_id UUID REFERENCES places(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_safe BOOLEAN,
  would_recommend BOOLEAN,
  images VARCHAR(500)[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

## PostGIS Functions

Useful PostGIS queries for geospatial operations:

```sql
-- Find nearby places within radius
SELECT *
FROM places
WHERE ST_DWithin(coordinates, ST_GeomFromText('POINT(lng lat)', 4326), distance_meters)
ORDER BY coordinates <-> ST_GeomFromText('POINT(lng lat)', 4326)
LIMIT 20;

-- Calculate distance between two points
SELECT ST_Distance(
  ST_GeomFromText('POINT(lng1 lat1)', 4326),
  ST_GeomFromText('POINT(lng2 lat2)', 4326)
) as distance_meters;

-- Find places in a polygon area
SELECT *
FROM places
WHERE ST_Contains(
  ST_GeomFromText('POLYGON((lng1 lat1, lng2 lat2, ...))', 4326),
  coordinates
);
```

## Indexes

Key indexes for performance:
- User email and username (lookup)
- Location coordinates (geospatial)
- Place coordinates (geospatial)
- Alert coordinates (geospatial)
- Foreign keys (joins)
- Created_at timestamps (sorting)

## Backup & Recovery

```bash
# Backup database
pg_dump -U postgres tourist_safety_db > backup.sql

# Restore database
psql -U postgres tourist_safety_db < backup.sql
```

## Maintenance

```bash
# Analyze query performance
ANALYZE;

# Vacuum and analyze
VACUUM ANALYZE;

# Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```
