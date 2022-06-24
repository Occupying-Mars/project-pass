import React, {ReactElement, useCallback, useState} from 'react';
import axios from 'axios';
import {useRouter} from 'next/router';
import {useSWRConfig} from 'swr';

import {useWeb3} from '@/hooks/useWeb3';
import routes from '@/routes';
import {Button, Input, Stack, Textarea} from 'degen';
import { Url } from 'url';

const createJsonMetaData = (data: any) => {
  return JSON.stringify(data);
};

export type CreateEntryFormValues = {
  title: string;
  body: string;
  gitrepo: string;
};

const CreateEntryForm = (): ReactElement => {
  const router = useRouter();
  const {mutate} = useSWRConfig();
  const {address, contract, provider} = useWeb3();
  const [values, setValues] = useState<CreateEntryFormValues>({
    title: '',
    body: '',
    gitrepo:'',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleTitleChange = (event) => {
    setValues((prevState) => {
      return {
        ...prevState,
        title: event.target.value,
      };
    });
  };

  const handleBodyChange = (event) => {
    setValues((prevState) => {
      return {
        ...prevState,
        body: event.target.value,
      };
    });
  };

  const handlerepoChange = (event) => {
    setValues((prevState) => {
      return {
        ...prevState,
        gitrepo: event.target.value,
      };
    });
  };

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        setSubmitting(true);

        if (!address) {
          throw new Error(
            'You need to be connected to MetaMask to create a post!',
          );
        }

        if (provider && contract) {
          const data = createJsonMetaData(values);
          console.log('data',data);
          const response = await axios.post(routes.api.arweave.post, {
            data,
            address,
          });
          console.log('response',response);
          const transactionId = response.data;
          console.log('transactionId: ', transactionId);
        }
        router.push(routes.home);
      } catch (error) {
        console.log('Error: ', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Something went wrong.';
        alert(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
    [values],
  );
  return (
    <Stack>
      <form onSubmit={handleSubmit}>
        <Stack space="4">
          <Input
            label="Title"
            hideLabel={true}
            placeholder="Give it a title..."
            value={values.title}
            onChange={handleTitleChange}
            autoFocus
            required
          />

          <Textarea
            label="Body"
            hideLabel={true}
            placeholder="Give a breif description"
            value={values.body}
            onChange={handleBodyChange}
            required
          />
          <Textarea
            label="github-link"
            hideLabel={true}
            placeholder="github repo of your project"
            value={values.gitrepo}
            onChange={handlerepoChange}
            required
          />
          <Button
            width={{xs: 'full', md: 'max'}}
            type="submit"
            data-testid="submit-btn"
            loading={submitting}
            disabled={submitting}
          >Publish
          </Button>
        
        </Stack>
      </form>
    </Stack>
  );
};

export default CreateEntryForm;
