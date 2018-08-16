from django.urls import reverse

from tardis.tardis_portal.context_processors import user_menu_processor


def sftp_menu_processor(request):
    """Add an 'Manage SSH Keys' item to the user menu

    Used as a context_processor to customise the MyTardis user menu
    :param request: request to modify context of
    :type request: HttpRequest
    :return: user_menu dictionary
    :rtype: dict
    """
    context = user_menu_processor(request)
    user_menu = context['user_menu']
    migrate_menu_item = dict(
        url=reverse('tardis.apps.sftp:sftp_keys'),
        icon='fa fa-key',
        label='Manage SSH Keys'
    )
    # Find the index of "Manage Account" item so we can add item after it.
    # If we can't just add it above logout.
    item_index = next((i + 1 for i, menu_item in enumerate(user_menu)
                       if 'label' in menu_item
                       and menu_item['label'] == "Manage Account"),
                      len(user_menu))

    user_menu.insert(item_index, migrate_menu_item)
    return dict(user_menu=user_menu)