CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar VARCHAR(500),
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'document', 'audio')),
  status VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'paid')),
  price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
  url VARCHAR(500),
  file_url VARCHAR(500),
  youtube_id VARCHAR(100),
  duration VARCHAR(20),
  thumbnail VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_content ON purchases(content_id);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
('site_name', '"SavoirBox"'),
('site_description', '"Plateforme de vidéos, documents et contenus audio"'),
('hero_title', '"Vidéos, Documents & Audio."'),
('hero_subtitle', '"La plateforme tout-en-un pour découvrir, apprendre et partager. Contenu gratuit ou premium, streaming intégré, sans publicité."'),
('cta_text', '"Rejoignez notre communauté et accédez à des centaines de contenus gratuitement."'),
('features', '[{"icon":"play-circle","title":"Vidéos YouTube","desc":"Streaming HD intégré sans quitter la plateforme."},{"icon":"file-text","title":"Documents PDF","desc":"Lecteur intégré avec aperçu. Téléchargement direct."},{"icon":"music","title":"Contenu Audio","desc":"Lecteur audio intégré. Streaming MP3, WAV, OGG."},{"icon":"award","title":"Contenu Premium","desc":"Monétisez vos créations. Accès sécurisé par paiement."}]'),
('stats', '[{"icon":"book-open","value":528,"suffix":"+","label":"Contenus disponibles"},{"icon":"users","value":12400,"suffix":"+","label":"Utilisateurs actifs"},{"icon":"star","value":48,"suffix":"/5","label":"Note moyenne"},{"icon":"zap","value":999,"suffix":"%","label":"Temps de disponibilité"}]')
ON CONFLICT (key) DO NOTHING;
