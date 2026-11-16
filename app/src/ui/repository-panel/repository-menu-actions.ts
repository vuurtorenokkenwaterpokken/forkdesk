import { enableWorktreeSupport } from '../../lib/feature-flag'
import { PopupType } from '../../models/popup'
import { Repository } from '../../models/repository'
import { IRepositoryGroup } from '../../models/repository-group'
import { Dispatcher } from '../dispatcher'

/**
 * The actions of the repository context menu that only need the dispatcher.
 *
 * The same as those of the repository list, which keeps its own copy so that
 * merging GitHub Desktop's changes stays easy.
 */
export function getRepositoryMenuActions(dispatcher: Dispatcher) {
  return {
    onMoveRepositoryToGroup: (
      repository: Repository,
      group: IRepositoryGroup
    ) => {
      dispatcher.moveRepositoryToGroup(repository, group)
    },
    onChangeRepositoryAlias: (repository: Repository) => {
      dispatcher.showPopup({
        type: PopupType.ChangeRepositoryAlias,
        repository,
      })
    },
    onRemoveRepositoryAlias: (repository: Repository) => {
      dispatcher.changeRepositoryAlias(repository, null)
    },
    onCreateWorktree: enableWorktreeSupport()
      ? (repository: Repository) => {
          dispatcher.showPopup({ type: PopupType.AddWorktree, repository })
        }
      : undefined,
    onShowWorktrees: enableWorktreeSupport()
      ? (repository: Repository) => {
          dispatcher.selectRepository(repository)
          dispatcher.showWorktreesFoldout()
        }
      : undefined,
  }
}
