import React from "react";
import styles from "./page.module.css";

/**
 * Shared inner-page header: breadcrumb, the page's single h1 and a lead
 * paragraph. `crumbs` is [{ name, href }]; the last entry is the current page.
 */
export default function PageHeader({ crumbs = [], title, lead, children, className = "" }) {
  return (
    <header className={`${styles.phead} ${className}`}>
      <div className={styles.wrap}>
        <Breadcrumb crumbs={crumbs} />
        {title && <h1 className={styles.title}>{title}</h1>}
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
      </div>
    </header>
  );
}

export function Breadcrumb({ crumbs = [] }) {
  const items = [{ name: "Home", href: "/" }, ...crumbs];
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.crumb}>
        {items.map((crumb, index) => {
          const last = index === items.length - 1;
          return (
            <li key={crumb.href || crumb.name}>
              {last ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <a href={crumb.href}>{crumb.name}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
