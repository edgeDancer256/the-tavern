import { fb } from 'service';
import { useChat } from 'context';
import { useResolved } from 'hooks';
import { useRef, useState } from 'react';
import { FileUpload } from 'components';
import { Icon, IconGroup, Image, Loader } from 'semantic-ui-react';

export const RailHeader = () => {
  const { chatConfig } = useChat();
  const configResolved = useResolved(chatConfig);
  const inputRef = useRef(null);
  const [image, setImage] = useState();

  return (
    <>
      <input
        className="file-input"
        type="file"
        ref={inputRef}
        accept="image/jpeg,image/png"
        onChange={e => {
          const file = e.target?.files?.[0];
          if (file) {
            setImage(file);
          }
        }}
      />

      {!!image && (
        <FileUpload
          crop
          file={image}
          header="Set your Avatar"
          close={() => setImage(null)}
          onSubmit={croppedImage => {
            const storageRef = fb.storage.ref();
            const uploadRef = storageRef.child(
              `${chatConfig.userSecret}_avatar.jpg`,
            );
            uploadRef.put(croppedImage).then(() => {
              uploadRef.getDownloadURL().then(url => {
                fb.firestore
                  .collection('chatUsers')
                  .doc(chatConfig.userSecret)
                  .update({ avatar: url })
                  .then(() => setImage(null));
              });
            });
          }}
        />
      )}

      <div className="left-rail-header">
        <Icon
          onClick={() => fb.auth.signOut()}
          className="sign-out"
          name="sign out"
        />
        {configResolved && chatConfig ? (
          <div className="current-user-info">
            <IconGroup
              onClick={() => {
                const input = inputRef.current;
                if (input) {
                  input.value = '';
                  input.click();
                }
              }}
              className="user-avatar"
              size="large"
            >
              {chatConfig.avatar ? (
                <Image src={chatConfig.avatar} avatar />
              ) : (
                <div className="empty-avatar">
                  {chatConfig.userName[0].toUpperCase()}
                </div>
              )}

              <Icon corner name="camera" inverted circular />
            </IconGroup>

            <div className="current-username">@{chatConfig.userName}</div>
          </div>
        ) : (
          <div className="user-loading">
            <Loader active size="small" />
          </div>
        )}
      </div>
    </>
  );
};
