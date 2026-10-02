import Image from "next/image";
import Link from "next/link";

export function CategoryCard({
  title,
  eyebrow,
  description,
  image,
  imageAlt,
  href,
  number,
}: {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  number?: string;
}) {
  return (
    <Link className="category-card" href={href}>
      <div className="category-card__image-wrap">
        <Image alt={imageAlt} className="category-card__image" fill sizes="(max-width: 680px) 100vw, 50vw" src={image} />
        {number && <span className="category-card__number">{number}</span>}
        <span aria-hidden="true" className="category-card__arrow">↗</span>
      </div>
      <div className="category-card__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}
