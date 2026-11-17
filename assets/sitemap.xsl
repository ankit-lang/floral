<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>Floral India XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.5;
            padding: 24px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          header {
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            color: #ffffff;
            padding: 32px 28px;
          }
          header h1 {
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.025em;
            margin-bottom: 8px;
          }
          header p {
            color: #ffe4e6;
            font-size: 0.95rem;
          }
          .stats-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 28px;
            background: #fff1f2;
            border-bottom: 1px solid #fecdd3;
            font-size: 0.9rem;
            color: #9f1239;
            font-weight: 500;
          }
          .stats-badge {
            background: #ffffff;
            padding: 4px 12px;
            border-radius: 9999px;
            border: 1px solid #fda4af;
          }
          .table-wrapper {
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.875rem;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            padding: 12px 18px;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
          }
          td {
            padding: 12px 18px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          tr:hover td {
            background-color: #fff1f2;
          }
          a {
            color: #e11d48;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.15s ease;
          }
          a:hover {
            color: #9f1239;
            text-decoration: underline;
          }
          .priority-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.75rem;
            background: #e0f2fe;
            color: #0369a1;
          }
          .priority-high {
            background: #dcfce7;
            color: #15803d;
          }
          .priority-mid {
            background: #fef9c3;
            color: #854d0e;
          }
          footer {
            padding: 20px 28px;
            text-align: center;
            font-size: 0.8rem;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Floral India – XML Sitemap</h1>
            <p>Generated index of search engine discoverable URLs for floralindia.com</p>
          </header>
          <div class="stats-bar">
            <span>Total URLs: <strong class="stats-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></span>
            <span>Standard: Sitemaps XML 0.9</span>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>URL (Location)</th>
                  <th style="width: 140px;">Last Modified</th>
                  <th style="width: 100px;">Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td style="color: #94a3b8;"><xsl:value-of select="position()"/></td>
                    <td>
                      <a href="{sitemap:loc}" target="_blank" rel="noopener">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td style="color: #64748b;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                    <td>
                      <xsl:variable name="priority" select="sitemap:priority"/>
                      <span>
                        <xsl:attribute name="class">
                          <xsl:choose>
                            <xsl:when test="$priority &gt;= 0.9">priority-tag priority-high</xsl:when>
                            <xsl:when test="$priority &gt;= 0.7">priority-tag priority-mid</xsl:when>
                            <xsl:otherwise>priority-tag</xsl:otherwise>
                          </xsl:choose>
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:priority"/>
                      </span>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
          <footer>
            Floral India (floralindia.com) — Standard XML Sitemap for Search Engine Crawlers
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
