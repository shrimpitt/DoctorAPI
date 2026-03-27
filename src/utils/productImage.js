/**
 * Переопределение названий товаров на фронте (пока в БД старые имена).
 * Ключ — slug из БД, значение — отображаемое название.
 */
const NAME_MAP = {
  epitalon:  "Retatrutide",
  vesugen:   "Tirzepadin",
  // добавляй сюда при необходимости
};

export function getProductName(product) {
  return NAME_MAP[product.slug] ?? product.name;
}

/**
 * Явный маппинг: slug товара → { метка объёма → имя файла в public/images/products/ }
 * Добавляй сюда новые товары по мере необходимости.
 */
const IMAGE_MAP = {
  epitalon: {
    "10 мг": "r_10.png",
    "20 мг": "r_20.png",
    "50 мг": "r_50.png",
  },
  vesugen: {
    "10 мг": "t_10.png",
    "20 мг": "t_20.png",
    "50 мг": "t_50.png",
  },
};

/**
 * Возвращает URL картинки для товара с учётом выбранного объёма.
 *
 * Приоритет:
 *   1. main_image_url из БД (если задан)
 *   2. IMAGE_MAP[slug][volLabel]              — явный маппинг выше
 *   3. /images/products/{slug}-{volLabel}.png — авто по slug (запасной)
 *   4. /images/products/{slug}.png            — без разбивки по объёму
 *   5. null → placeholder
 */
export function getProductImage(product, volLabel) {
  if (product.slug) {
    // 1. Явный маппинг по объёму (r_10.png, t_20.png …)
    const bySlug = IMAGE_MAP[product.slug];
    if (bySlug && volLabel && bySlug[volLabel]) {
      return `/images/products/${bySlug[volLabel]}`;
    }
  }

  // 2. main_image_url из БД (если маппинга нет)
  if (product.main_image_url) return product.main_image_url;

  // 3. Авто по slug (запасной)
  if (product.slug) {
    if (volLabel) {
      const suffix = volLabel.toLowerCase().replace(/\s+/g, "").replace("мг", "mg").replace("мл", "ml");
      return `/images/products/${product.slug}-${suffix}.png`;
    }
    return `/images/products/${product.slug}.png`;
  }

  return null;
}
