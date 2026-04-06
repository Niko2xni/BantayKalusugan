"""
Admin Account Creation Script
==============================
Run this script to create an admin account directly in the database.
This is the ONLY way to create admin accounts — the public registration
page blocks @bantaykalusugan.com emails.

Usage:
  1. Make sure your virtual environment is activated:
     venv\Scripts\activate.ps1

  2. Run the script:
     python create_admin.py

  3. Follow the prompts to enter the admin's details.
"""

import sys
import os

# Add the parent directory to the path so we can import from app/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.security import get_password_hash

def create_admin():
    print("=" * 50)
    print("  BantayKalusugan - Admin Account Creator")
    print("=" * 50)
    print()

    # Collect admin details
    first_name = input("First Name: ").strip()
    last_name = input("Last Name: ").strip()
    email = input("Email (must end with @bantaykalusugan.com): ").strip()

    # Validate email domain
    if not email.lower().endswith("@bantaykalusugan.com"):
        print("\n❌ Error: Admin email must end with @bantaykalusugan.com")
        return

    phone = input("Phone Number (11 digits, starts with 09): ").strip()
    date_of_birth = input("Date of Birth (YYYY-MM-DD): ").strip()
    sex = input("Sex (Male/Female): ").strip()
    address = input("Address: ").strip()
    barangay = input("Barangay: ").strip()
    password = input("Password (min 8 characters): ").strip()

    if len(password) < 8:
        print("\n❌ Error: Password must be at least 8 characters.")
        return

    hashed_password = get_password_hash(password)

    db = SessionLocal()

    try:
        # Check if email already exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            print(f"\n❌ Error: An account with email '{email}' already exists.")
            return

        # Create the admin user
        from datetime import date as date_type
        admin_user = models.User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            date_of_birth=date_type.fromisoformat(date_of_birth),
            sex=sex,
            address=address,
            barangay=barangay,
            hashed_password=hashed_password,
            role="admin",
            is_active=True,
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print()
        print("✅ Admin account created successfully!")
        print(f"   Name:  {admin_user.first_name} {admin_user.last_name}")
        print(f"   Email: {admin_user.email}")
        print(f"   Role:  {admin_user.role}")
        print()
        print("You can now log in at the website with these credentials.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating admin: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
