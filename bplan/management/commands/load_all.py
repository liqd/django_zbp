from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):

    def handle(self, *args, **options):

        call_command('load_bezirke')
        call_command('load_ortsteile')
        call_command('load_bplan')