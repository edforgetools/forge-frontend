#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime
from urllib.parse import urlparse

"""
JSON-LD Schema Validation Script
Validates JSON-LD files against Schema.org requirements
"""

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'artifacts', 'seo')
VALIDATION_OUTPUT = os.path.join(ARTIFACTS_DIR, 'validation.txt')

# Required fields for SoftwareApplication schema
REQUIRED_FIELDS = [
    '@context',
    '@type',
    'name',
    'description',
    'url'
]

# Valid @type values for our use case
VALID_TYPES = [
    'SoftwareApplication',
    'WebApplication',
    'MobileApplication'
]

# Valid application categories
VALID_CATEGORIES = [
    'MultimediaApplication',
    'BusinessApplication',
    'GameApplication',
    'SocialNetworkingApplication',
    'WebApplication'
]

def is_valid_url(url_string):
    """Simple URL validation"""
    try:
        result = urlparse(url_string)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_jsonld(jsonld, filename):
    """Validate a single JSON-LD object"""
    errors = []
    warnings = []

    # Check if it's a valid JSON object
    if not isinstance(jsonld, dict):
        errors.append(f"{filename}: Invalid JSON-LD - must be an object")
        return errors, warnings

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in jsonld:
            errors.append(f"{filename}: Missing required field '{field}'")

    # Validate @context
    if '@context' in jsonld and jsonld['@context'] != 'https://schema.org':
        errors.append(f"{filename}: Invalid @context - must be 'https://schema.org'")

    # Validate @type
    if '@type' in jsonld and jsonld['@type'] not in VALID_TYPES:
        errors.append(f"{filename}: Invalid @type '{jsonld['@type']}' - must be one of: {', '.join(VALID_TYPES)}")

    # Validate applicationCategory
    if 'applicationCategory' in jsonld and jsonld['applicationCategory'] not in VALID_CATEGORIES:
        warnings.append(f"{filename}: Unusual applicationCategory '{jsonld['applicationCategory']}' - consider using: {', '.join(VALID_CATEGORIES)}")

    # Validate offers structure
    if 'offers' in jsonld:
        offers = jsonld['offers']
        if not isinstance(offers, dict):
            errors.append(f"{filename}: 'offers' must be an object")
        else:
            if offers.get('@type') != 'Offer':
                errors.append(f"{filename}: offers.@type must be 'Offer'")
            if 'price' not in offers:
                errors.append(f"{filename}: offers.price is required")
            if 'priceCurrency' not in offers:
                errors.append(f"{filename}: offers.priceCurrency is required")

    # Validate creator structure
    if 'creator' in jsonld:
        creator = jsonld['creator']
        if not isinstance(creator, dict):
            errors.append(f"{filename}: 'creator' must be an object")
        else:
            if creator.get('@type') != 'Organization':
                errors.append(f"{filename}: creator.@type must be 'Organization'")
            if 'name' not in creator:
                errors.append(f"{filename}: creator.name is required")

    # Validate featureList
    if 'featureList' in jsonld and not isinstance(jsonld['featureList'], list):
        errors.append(f"{filename}: 'featureList' must be an array")

    # Check for common issues
    if 'name' in jsonld and not isinstance(jsonld['name'], str):
        errors.append(f"{filename}: 'name' must be a string")

    if 'description' in jsonld and not isinstance(jsonld['description'], str):
        errors.append(f"{filename}: 'description' must be a string")

    if 'url' in jsonld and not isinstance(jsonld['url'], str):
        errors.append(f"{filename}: 'url' must be a string")

    # Check for valid URLs
    if 'url' in jsonld and not is_valid_url(jsonld['url']):
        warnings.append(f"{filename}: 'url' appears to be invalid: {jsonld['url']}")

    if 'screenshot' in jsonld and not is_valid_url(jsonld['screenshot']):
        warnings.append(f"{filename}: 'screenshot' appears to be invalid: {jsonld['screenshot']}")

    return errors, warnings

def generate_validation_report(results, total_errors, total_warnings):
    """Generate detailed validation report"""
    timestamp = datetime.now().isoformat()

    report = f"""JSON-LD Validation Report
Generated: {timestamp}
========================================

Summary:
- Files processed: {len(results)}
- Total errors: {total_errors}
- Total warnings: {total_warnings}
- Valid files: {sum(1 for r in results if r['valid'])}/{len(results)}

"""

    for result in results:
        report += f"""
File: {result['file']}
Status: {'✅ VALID' if result['valid'] else '❌ INVALID'}
Errors: {len(result['errors'])}
Warnings: {len(result['warnings'])}

"""

        if result['errors']:
            report += 'Errors:\n'
            for error in result['errors']:
                report += f'  - {error}\n'
            report += '\n'

        if result['warnings']:
            report += 'Warnings:\n'
            for warning in result['warnings']:
                report += f'  - {warning}\n'
            report += '\n'

        report += '---\n'

    if total_errors == 0:
        report += '\n🎉 All JSON-LD files passed validation! No schema errors found.\n'
    else:
        report += f'\n❌ Validation failed with {total_errors} error(s). Please review and fix the issues above.\n'

    return report

def validate_all_jsonld_files():
    """Main validation function"""
    print('🔍 Starting JSON-LD validation...\n')

    if not os.path.exists(ARTIFACTS_DIR):
        print(f'❌ Artifacts directory not found: {ARTIFACTS_DIR}')
        return

    files = [f for f in os.listdir(ARTIFACTS_DIR) if f.endswith('.json')]
    files.sort()

    if not files:
        print('❌ No JSON files found in artifacts/seo/')
        return

    total_errors = 0
    total_warnings = 0
    results = []

    for file in files:
        file_path = os.path.join(ARTIFACTS_DIR, file)
        print(f'📄 Validating {file}...')

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            jsonld = json.loads(content)
            errors, warnings = validate_jsonld(jsonld, file)

            total_errors += len(errors)
            total_warnings += len(warnings)

            if not errors and not warnings:
                print(f'  ✅ {file} - No issues found')
            else:
                if errors:
                    print(f'  ❌ {file} - {len(errors)} error(s):')
                    for error in errors:
                        print(f'    - {error}')
                if warnings:
                    print(f'  ⚠️  {file} - {len(warnings)} warning(s):')
                    for warning in warnings:
                        print(f'    - {warning}')

            results.append({
                'file': file,
                'errors': errors,
                'warnings': warnings,
                'valid': len(errors) == 0
            })

        except json.JSONDecodeError as e:
            print(f'  ❌ {file} - Parse error: {e}')
            total_errors += 1
            results.append({
                'file': file,
                'errors': [f'Parse error: {e}'],
                'warnings': [],
                'valid': False
            })
        except Exception as e:
            print(f'  ❌ {file} - Error: {e}')
            total_errors += 1
            results.append({
                'file': file,
                'errors': [f'Error: {e}'],
                'warnings': [],
                'valid': False
            })

    # Generate validation report
    report = generate_validation_report(results, total_errors, total_warnings)

    # Save validation results
    with open(VALIDATION_OUTPUT, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f'\n📝 Validation report saved to: {VALIDATION_OUTPUT}')

    # Summary
    print('\n📊 Validation Summary:')
    print(f'  Files processed: {len(files)}')
    print(f'  Total errors: {total_errors}')
    print(f'  Total warnings: {total_warnings}')
    print(f'  Valid files: {sum(1 for r in results if r["valid"])}/{len(files)}')

    if total_errors == 0:
        print('\n🎉 All JSON-LD files are valid! No schema errors found.')
        return True
    else:
        print('\n❌ Validation failed. Please fix the errors above.')
        return False

if __name__ == '__main__':
    success = validate_all_jsonld_files()
    sys.exit(0 if success else 1)
