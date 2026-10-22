#!/usr/bin/env python3
"""Apply fixes to _add_products_13_15.py."""
import io, os

BASE = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(BASE, '_add_products_13_15.py')

with io.open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- Fix 1: edit() function idempotency - check n_new before n_old ---
old_edit = (
    '        if n_old == 1:\n'
    '            text = text.replace(old, new, 1)\n'
    '            applied += 1\n'
    '        elif n_new >= 1:\n'
    '            skipped += 1'
)
new_edit = (
    '        if n_new >= 1:\n'
    '            skipped += 1\n'
    '        elif n_old == 1:\n'
    '            text = text.replace(old, new, 1)\n'
    '            applied += 1\n'
    '        elif n_new >= 1:\n'
    '            skipped += 1'
)

already_fixed_1 = '        if n_new >= 1:\n            skipped += 1\n        elif n_old == 1:' in content
if already_fixed_1:
    print('Fix 1 (edit idempotency): already applied')
elif content.count(old_edit) == 1:
    content = content.replace(old_edit, new_edit, 1)
    print('Fix 1: applied')
else:
    print('Fix 1: ERROR - pattern not found')

# --- Fix 2: PANELS_NEW - comma-at-end format ---
comma_at_line_start = "    , product4:" in content
if not comma_at_line_start:
    print('Fix 2 (PANELS format): already applied')
else:
    panels_old = (
        "    product3: 'passage3-panel'\\n"
        "    , product4: 'passage4-panel'\\n"
        "    , product5: 'passage5-panel'\\n"
        "    , product6: 'passage6-panel'\\n"
        "    , product7: 'passage7-panel'\\n"
        "    , product8: 'passage8-panel'\\n"
        "    , product9: 'passage9-panel'\\n"
        "    , product10: 'passage10-panel'\\n"
        "    , product11: 'passage11-panel'\\n"
        "    , product12: 'thoughts-panel'\\n"
        "    , product13: 'mirror14-panel'\\n"
        "    , product14: 'mirrorre-panel'\\n"
        "    , product15: 'sanctuary-panel'\\n"
    )
    panels_new = (
        "    product3: 'passage3-panel',\\n"
        "    product4: 'passage4-panel',\\n"
        "    product5: 'passage5-panel',\\n"
        "    product6: 'passage6-panel',\\n"
        "    product7: 'passage7-panel',\\n"
        "    product8: 'passage8-panel',\\n"
        "    product9: 'passage9-panel',\\n"
        "    product10: 'passage10-panel',\\n"
        "    product11: 'passage11-panel',\\n"
        "    product12: 'thoughts-panel',\\n"
        "    product13: 'mirror14-panel',\\n"
        "    product14: 'mirrorre-panel',\\n"
        "    product15: 'sanctuary-panel'\\n"
    )
    if content.count(panels_old) == 1:
        content = content.replace(panels_old, panels_new, 1)
        print('Fix 2: applied')
    else:
        print('Fix 2: ERROR - pattern not found, count =', content.count(panels_old))

# --- Fix 3: SMOKE_OLD - make unique ---
smoke_old_start = content.find('SMOKE_OLD = (')
smoke_old_end = content.find('SMOKE_NEW = (')
if smoke_old_start == -1 or smoke_old_end == -1:
    print('Fix 3: ERROR - SMOKE_OLD section not found')
else:
    smoke_old_section = content[smoke_old_start:smoke_old_end]
    if "after product12" in smoke_old_section:
        print('Fix 3 (SMOKE_OLD uniqueness): already applied')
    else:
        old_smoke_start = (
            "    \"  ok($('sec-protocol').classList.contains('active'), 'protocol tab active again');\\n\"\n"
            "    \"\\n\"\n"
            "    \"  const scriptErrors = errors.filter(e => e.indexOf('Uncaught') > -1);\""
        )
        new_smoke_start = (
            "    \"  ok(!$('app').classList.contains('is-hidden'), 'protocol app visible again after product12');\\n\"\n"
            "    \"  ok($('sec-protocol').classList.contains('active'), 'protocol tab active again');\\n\"\n"
            "    \"\\n\"\n"
            "    \"  const scriptErrors = errors.filter(e => e.indexOf('Uncaught') > -1);\""
        )
        if content.count(old_smoke_start) == 1:
            content = content.replace(old_smoke_start, new_smoke_start, 1)
            print('Fix 3: applied')
        else:
            print('Fix 3: ERROR - pattern not found, count =', content.count(old_smoke_start))

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File written:', path)
