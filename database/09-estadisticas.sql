-- Eventos de interacción por negocio (módulo Estadísticas)
CREATE TABLE IF NOT EXISTS business_events (
  id BIGSERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  event_type VARCHAR(40) NOT NULL
    CHECK (event_type IN (
      'profile_view',
      'whatsapp_click',
      'phone_click',
      'instagram_click',
      'share_click',
      'coupon_claim',
      'coupon_used'
    )),
  session_id VARCHAR(64),
  user_ip VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_be_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_be_business ON business_events (business_id);
CREATE INDEX IF NOT EXISTS idx_be_type ON business_events (event_type);
CREATE INDEX IF NOT EXISTS idx_be_created ON business_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_be_business_type_created ON business_events (business_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_be_session_dedupe ON business_events (business_id, event_type, session_id, created_at DESC);
