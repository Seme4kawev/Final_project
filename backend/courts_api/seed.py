from django.contrib.auth.models import User
from courts_api.models import Court

def seed_db():
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Admin user created.")

    if not Court.objects.exists():
        Court.objects.create(name="Центральный теннисный корт", sport_type="Теннис", description="Профессиональное хардовое покрытие, освещение.", is_active=True)
        Court.objects.create(name="Баскетбольная площадка №1", sport_type="Баскетбол", description="Стритбольная площадка с резиновым покрытием.", is_active=True)
        Court.objects.create(name="Волейбольная площадка (Песок)", sport_type="Волейбол", description="Площадка для пляжного волейбола.", is_active=True)
        print("Courts seeded.")
