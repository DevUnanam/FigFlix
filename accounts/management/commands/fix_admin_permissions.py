"""
Management command to fix admin user permissions.
This ensures all users with role='admin' have is_staff and is_superuser set to True.
"""
from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Fix admin user permissions - grant Django admin access to all users with role=admin'

    def handle(self, *args, **options):
        # Find all users with role='admin' but missing Django admin permissions
        admin_users = User.objects.filter(role='admin')

        fixed_count = 0
        for user in admin_users:
            needs_update = False

            if not user.is_staff:
                user.is_staff = True
                needs_update = True

            if not user.is_superuser:
                user.is_superuser = True
                needs_update = True

            if needs_update:
                user.save()
                fixed_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Fixed permissions for admin user: {user.username}')
                )

        if fixed_count == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ All admin users already have correct permissions!')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\n🎉 Fixed {fixed_count} admin user(s)!')
            )
